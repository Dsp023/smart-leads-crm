import { Response, NextFunction } from 'express';
import Lead from '../models/Lead';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateLeadInput, UpdateLeadInput } from '../validators/lead.validator';

// Private helper to construct MongoDB queries from search/filter inputs
const buildQuery = (queryParams: any) => {
  const query: any = {};
  const { status, source, search } = queryParams;

  if (status) {
    query.status = status;
  }

  if (source) {
    query.source = source;
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
    ];
  }

  return query;
};

// Private helper to construct Sorting constraints
const buildSort = (sortParam?: string) => {
  if (sortParam === 'oldest') {
    return { createdAt: 1 };
  }
  return { createdAt: -1 }; // Default: Latest
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email, status, source }: CreateLeadInput = req.body;

    const newLead = await Lead.create({
      name,
      email,
      status: status || 'New',
      source,
      createdBy: req.user.id,
    });

    const populatedLead = await Lead.findById(newLead._id).populate('createdBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        lead: populatedLead,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse pagination variables
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = buildQuery(req.query);
    const sort = buildSort(req.query.sort as string);

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name role');

    const totalPages = Math.ceil(totalLeads / limit);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          totalLeads,
          totalPages: totalPages || 1,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id).populate('createdBy', 'name role email');
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found or does not exist.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: UpdateLeadInput = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
      return;
    }

    // Apply updates
    Object.assign(lead, updates);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id).populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: {
        lead: populatedLead,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found or already deleted.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = buildQuery(req.query);
    const sort = buildSort(req.query.sort as string);

    // Fetch ALL matching leads under the active filter constraints (no limit/skip!)
    const leads = await Lead.find(query)
      .sort(sort as any)
      .populate('createdBy', 'name');

    // Helper to escape values containing commas, quotes or linebreaks for CSV compliance
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const stringified = String(val);
      if (/[",\n\r]/.test(stringified)) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    // Header row
    let csvContent = 'Name,Email,Status,Source,Created By,Created At\n';

    // Data rows
    leads.forEach((lead) => {
      const creatorName = lead.createdBy ? (lead.createdBy as any).name : 'System';
      csvContent += `${escapeCSV(lead.name)},${escapeCSV(lead.email)},${escapeCSV(lead.status)},${escapeCSV(lead.source)},${escapeCSV(creatorName)},${escapeCSV(lead.createdAt.toISOString())}\n`;
    });

    // Set streaming headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

import {
  createLostItem,
  getLostItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
} from './itemController.js';

export const getLostItemById = getItemById;
export const getMyLostItems = (req, res, next) => {
  req.query.type = 'lost';
  return getMyReports(req, res, next);
};

export {
  createLostItem,
  getLostItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
};

export default {
  createLostItem,
  getLostItems,
  getLostItemById,
  getItemById,
  getMyReports,
  getMyLostItems,
  updateItem,
  deleteItem
};

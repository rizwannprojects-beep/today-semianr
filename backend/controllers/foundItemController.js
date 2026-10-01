import {
  createFoundItem,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
} from './itemController.js';

export const getFoundItemById = getItemById;
export const getMyFoundItems = (req, res, next) => {
  req.query.type = 'found';
  return getMyReports(req, res, next);
};

export {
  createFoundItem,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
};

export default {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getItemById,
  getMyReports,
  getMyFoundItems,
  updateItem,
  deleteItem
};

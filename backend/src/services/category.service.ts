import { categoryRepository } from '../repositories/category.repository';

export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },
};

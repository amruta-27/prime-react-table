// src/services/artService.ts
import axios from "axios";
import type { UserObj } from "./UserObj"; 

const BASE_URL = "https://api.artic.edu/api/v1/artworks";

export const getUser = async (page: number): Promise<{ data: UserObj[]; total: number }> => {
  const response = await axios.get(`${BASE_URL}?page=${page}`);
  const data = response.data.data;
  const total = response.data.pagination.total; 
  return { data, total };
};


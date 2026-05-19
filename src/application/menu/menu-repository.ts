import type { MenuCatalog, MenuEntry, MenuSection } from "@/domain/menu/types";

export type MenuEntryInput = Omit<MenuEntry, "id" | "sortOrder" | "isAvailable"> & {
  id?: string;
  sortOrder?: number;
  isAvailable?: boolean;
};

export type MenuRepository = {
  getCatalog(): Promise<MenuCatalog>;
  getAdminCatalog(): Promise<MenuCatalog>;
  upsertEntry(input: MenuEntryInput): Promise<void>;
  setEntryAvailability(id: string, isAvailable: boolean): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  listSections(): Promise<MenuSection[]>;
};

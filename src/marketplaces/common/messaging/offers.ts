export interface Offer {
  title: string;
  url: string;
  // TODO: parse price to be a number
  price: string;
  editUrl: string;
}

export interface OffersPage {
  offers: Offer[];
  currentPage: number;
  totalPages: number;
}

/**
 * Workaround for type-only files in snowpack
 * @see https://github.com/withastro/snowpack/discussions/1589#discussioncomment-130176
 */
export {};

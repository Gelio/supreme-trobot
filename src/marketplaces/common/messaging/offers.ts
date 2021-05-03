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

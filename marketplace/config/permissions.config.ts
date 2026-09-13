const PERMISSIONS: Record<string, string[]> = {
  curator: ['certifyProduct', 'approveListing', 'listProducts', 'listListings'],
  farmer: ['createProduct', 'listProducts'],
  merchant: ['createListing', 'listListings', 'viewSales'],
  tourist: ['listProducts', 'viewProduct'],
};
export default PERMISSIONS;

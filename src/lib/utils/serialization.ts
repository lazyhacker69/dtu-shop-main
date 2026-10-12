// lib/utils/serialization.ts
// lib/utils/serialization.ts
export function serializeProduct(product: any) {
  return {
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    tags: product.tags,
    quantity: product.quantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variants: product.variants?.map((variant: any) => ({
      _id: variant._id?.toString() || '',
      type: variant.type,
      value: variant.value,
      price: variant.price || 0,
      stock: variant.stock || 0
    })) || [],
    category: product.category ? {
      _id: product.category._id.toString(),
      name: product.category.name,
      slug: product.category.slug
    } : null
  };
}

export function serializeProductForCart(product: any) {
  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    variants: product.variants?.map((variant: any) => ({
      type: variant.type,
      value: variant.value,
      price: variant.price || 0,
      stock: variant.stock || 0
    })) || [],
    images: product.images
  };
}


  export function serializeCategory(category: any) {
    return {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      image: category.image
    };
  }
  
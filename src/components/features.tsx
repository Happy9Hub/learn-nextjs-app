import { Product } from "@/types/product";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("https://backend.codingthailand.com/v2/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  const json: unknown = await res.json(); // Array of products
  return json as Product[];
}

const Features = async () => {

  const products = await fetchProducts();

  return (
    <div className="px-6 py-20">
      <h2 className="mx-auto max-w-3xl text-center font-medium text-4xl tracking-[-0.045em] sm:text-[2.75rem]">
        รายการสินค้าทั้งหมด
      </h2>
      <div className="mx-auto mt-10 grid max-w-(--breakpoint-lg) gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            className="flex flex-col rounded-xl border bg-card p-6"
            key={product.id}
          >
            <div className="mb-5">
              {product.barcode}
            </div>
            <span className="font-medium text-lg">{product.category.name}</span>
            <p className="mt-1 text-[15px] text-foreground/80">
                ชื่อสินค้า: {product.name} ราคา: {product.price} บาท
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;

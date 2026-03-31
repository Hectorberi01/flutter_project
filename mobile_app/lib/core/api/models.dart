// ═══════════════════════════════════════════════════════════════════════════
// MODELS — simples classes Dart (sans codegen pour portabilité maximale)
// ═══════════════════════════════════════════════════════════════════════════

// ── User ─────────────────────────────────────────────────────────────────────
class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? address;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.address,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> j) => UserModel(
    id: j['id'],
    name: j['name'],
    email: j['email'],
    role: j['role'] ?? 'user',
    phone: j['phone'],
    address: j['address'],
    createdAt: DateTime.parse(j['createdAt']),
  );

  bool get isAdmin => role == 'admin';
}

// ── Product ───────────────────────────────────────────────────────────────────
class ProductModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final int stock;
  final String? category;
  final String? imageUrl;
  final bool isActive;
  final DateTime createdAt;

  const ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.stock,
    this.category,
    this.imageUrl,
    required this.isActive,
    required this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> j) => ProductModel(
    id: j['id'],
    name: j['name'],
    description: j['description'],
    price: double.parse(j['price'].toString()),
    stock: j['stock'] ?? 0,
    category: j['category'],
    imageUrl: j['imageUrl'],
    isActive: j['isActive'] ?? true,
    createdAt: DateTime.parse(j['createdAt']),
  );

  bool get inStock => stock > 0;
}

class ProductListResponse {
  final List<ProductModel> products;
  final int total;
  final int page;
  final int pages;

  const ProductListResponse({
    required this.products,
    required this.total,
    required this.page,
    required this.pages,
  });

  factory ProductListResponse.fromJson(Map<String, dynamic> j) =>
      ProductListResponse(
        products: (j['products'] as List)
            .map((e) => ProductModel.fromJson(e))
            .toList(),
        total: j['total'] ?? 0,
        page: j['page'] ?? 1,
        pages: j['pages'] ?? 1,
      );
}

// ── Cart ──────────────────────────────────────────────────────────────────────
class CartItemModel {
  final String id;
  final int quantity;
  final String cartId;
  final String productId;
  final ProductModel product;

  const CartItemModel({
    required this.id,
    required this.quantity,
    required this.cartId,
    required this.productId,
    required this.product,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> j) => CartItemModel(
    id: j['id'],
    quantity: j['quantity'],
    cartId: j['cartId'],
    productId: j['productId'],
    product: ProductModel.fromJson(j['product']),
  );

  double get subtotal => product.price * quantity;
}

class CartModel {
  final String id;
  final String userId;
  final List<CartItemModel> items;
  final double total;

  const CartModel({
    required this.id,
    required this.userId,
    required this.items,
    required this.total,
  });

  factory CartModel.fromJson(Map<String, dynamic> j) => CartModel(
    id: j['id'],
    userId: j['userId'],
    items: (j['items'] as List? ?? [])
        .map((e) => CartItemModel.fromJson(e))
        .toList(),
    total: double.parse((j['total'] ?? 0).toString()),
  );

  int get itemCount => items.fold(0, (sum, i) => sum + i.quantity);
}

// ── Order ─────────────────────────────────────────────────────────────────────
class OrderItemModel {
  final String id;
  final int quantity;
  final double unitPrice;
  final ProductModel product;

  const OrderItemModel({
    required this.id,
    required this.quantity,
    required this.unitPrice,
    required this.product,
  });

  // ✅ CORRIGÉ — product peut être null au retour du POST /orders
  factory OrderItemModel.fromJson(Map<String, dynamic> j) => OrderItemModel(
    id: j['id'] ?? '',
    quantity: j['quantity'] ?? 1,
    unitPrice: double.parse(
      (j['unitPrice'] ?? j['unit_price'] ?? 0).toString(),
    ),
    product: j['product'] != null
        ? ProductModel.fromJson(j['product'] as Map<String, dynamic>)
        : ProductModel(
            id: j['productId'] ?? '',
            name: 'Produit',
            price: double.parse((j['unitPrice'] ?? 0).toString()),
            stock: 0,
            isActive: true,
            createdAt: DateTime.now(),
          ),
  );

  double get subtotal => unitPrice * quantity;
}

class OrderModel {
  final String id;
  final String reference;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final double totalAmount;
  final String? shippingAddress;
  final String? notes;
  final List<OrderItemModel> items;
  final DateTime createdAt;

  const OrderModel({
    required this.id,
    required this.reference,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.totalAmount,
    this.shippingAddress,
    this.notes,
    required this.items,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> j) => OrderModel(
    id: j['id'],
    reference: j['reference'] ?? '',
    status: j['status'] ?? 'pending',
    paymentStatus: j['paymentStatus'] ?? 'unpaid',
    paymentMethod: j['paymentMethod'] ?? 'cash_on_delivery',
    totalAmount: double.parse((j['totalAmount'] ?? 0).toString()),
    shippingAddress: j['shippingAddress'],
    notes: j['notes'],
    // ✅ CORRIGÉ — cast explicite Map<String, dynamic>
    items: (j['items'] as List? ?? [])
        .map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
        .toList(),
    createdAt: DateTime.parse(j['createdAt']),
  );
}

// ── Favorite ──────────────────────────────────────────────────────────────────
class FavoriteModel {
  final String id;
  final String productId;
  final ProductModel product;
  final DateTime createdAt;

  const FavoriteModel({
    required this.id,
    required this.productId,
    required this.product,
    required this.createdAt,
  });

  factory FavoriteModel.fromJson(Map<String, dynamic> j) => FavoriteModel(
    id: j['id'],
    productId: j['productId'],
    product: ProductModel.fromJson(j['product']),
    createdAt: DateTime.parse(j['createdAt']),
  );
}

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';
import 'models.dart';

// ── Singleton ApiService ──────────────────────────────────────────────────────
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());
const _storage = FlutterSecureStorage();

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════
class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;
  AuthState copyWith({UserModel? user, bool? isLoading, String? error}) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;
  AuthNotifier(this._api) : super(const AuthState()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      try {
        final user = await _api.getMe();
        state = state.copyWith(user: user);
      } catch (_) {
        await _storage.delete(key: 'auth_token');
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.login(email: email, password: password);
      await _storage.write(key: 'auth_token', value: res['token']);
      final user = UserModel.fromJson(res['user']);
      state = state.copyWith(user: user, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> register(
    String name,
    String email,
    String password,
    String? phone,
  ) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _api.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
      );
      return await login(email, password);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    state = const AuthState();
  }

  Future<void> updateProfile({
    String? name,
    String? phone,
    String? address,
  }) async {
    try {
      final user = await _api.updateMe(
        name: name,
        phone: phone,
        address: address,
      );
      state = state.copyWith(user: user);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(apiServiceProvider)),
);

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═════════════════════════════════════════════════════════════════════════════
class ProductsState {
  final List<ProductModel> products;
  final bool isLoading;
  final String? error;
  final int page;
  final int pages;
  final String? search;
  final String? category;

  const ProductsState({
    this.products = const [],
    this.isLoading = false,
    this.error,
    this.page = 1,
    this.pages = 1,
    this.search,
    this.category,
  });

  bool get hasMore => page < pages;
  ProductsState copyWith({
    List<ProductModel>? products,
    bool? isLoading,
    String? error,
    int? page,
    int? pages,
    String? search,
    String? category,
  }) => ProductsState(
    products: products ?? this.products,
    isLoading: isLoading ?? this.isLoading,
    error: error,
    page: page ?? this.page,
    pages: pages ?? this.pages,
    search: search ?? this.search,
    category: category ?? this.category,
  );
}

class ProductsNotifier extends StateNotifier<ProductsState> {
  final ApiService _api;
  ProductsNotifier(this._api) : super(const ProductsState()) {
    load();
  }

  Future<void> load({bool refresh = false}) async {
    if (state.isLoading) return;
    final nextPage = refresh ? 1 : state.page;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.getProducts(
        search: state.search,
        category: state.category,
        page: nextPage,
      );
      final list = refresh
          ? res.products
          : [...state.products, ...res.products];
      state = state.copyWith(
        products: list,
        isLoading: false,
        page: res.pages > nextPage ? nextPage + 1 : nextPage,
        pages: res.pages,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> search(String query) async {
    state = ProductsState(
      search: query.isEmpty ? null : query,
      category: state.category,
    );
    await load(refresh: true);
  }

  Future<void> filterByCategory(String? cat) async {
    state = ProductsState(category: cat, search: state.search);
    await load(refresh: true);
  }

  Future<void> refresh() => load(refresh: true);
}

final productsProvider = StateNotifierProvider<ProductsNotifier, ProductsState>(
  (ref) => ProductsNotifier(ref.read(apiServiceProvider)),
);

final productDetailProvider = FutureProvider.family<ProductModel, String>(
  (ref, id) => ref.read(apiServiceProvider).getProductById(id),
);

// ═════════════════════════════════════════════════════════════════════════════
// CART
// ═════════════════════════════════════════════════════════════════════════════
class CartNotifier extends StateNotifier<AsyncValue<CartModel?>> {
  final ApiService _api;
  CartNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    try {
      final cart = await _api.getCart();
      state = AsyncValue.data(cart);
    } catch (e, s) {
      state = AsyncValue.error(e, s);
    }
  }

  Future<void> addItem(String productId, {int quantity = 1}) async {
    try {
      final cart = await _api.addToCart(
        productId: productId,
        quantity: quantity,
      );
      state = AsyncValue.data(cart);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateItem(String itemId, int quantity) async {
    try {
      final cart = await _api.updateCartItem(
        itemId: itemId,
        quantity: quantity,
      );
      state = AsyncValue.data(cart);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> removeItem(String itemId) async {
    try {
      final cart = await _api.removeCartItem(itemId);
      state = AsyncValue.data(cart);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> clear() async {
    await _api.clearCart();
    await load();
  }
}

final cartProvider =
    StateNotifierProvider<CartNotifier, AsyncValue<CartModel?>>(
      (ref) => CartNotifier(ref.read(apiServiceProvider)),
    );

final cartItemCountProvider = Provider<int>((ref) {
  return ref
      .watch(cartProvider)
      .maybeWhen(data: (cart) => cart?.itemCount ?? 0, orElse: () => 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═════════════════════════════════════════════════════════════════════════════
class OrdersNotifier extends StateNotifier<AsyncValue<List<OrderModel>>> {
  final ApiService _api;
  OrdersNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    try {
      final orders = await _api.getMyOrders();
      state = AsyncValue.data(orders);
    } catch (e, s) {
      state = AsyncValue.error(e, s);
    }
  }

  Future<OrderModel> checkout({
    required String shippingAddress,
    String paymentMethod = 'cash_on_delivery',
    String? notes,
  }) async {
    final order = await _api.checkout(
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      notes: notes,
    );
    await load();
    return order;
  }

  Future<void> cancel(String id) async {
    await _api.cancelOrder(id);
    await load();
  }
}

final ordersProvider =
    StateNotifierProvider<OrdersNotifier, AsyncValue<List<OrderModel>>>(
      (ref) => OrdersNotifier(ref.read(apiServiceProvider)),
    );

// ═════════════════════════════════════════════════════════════════════════════
// FAVORITES
// ═════════════════════════════════════════════════════════════════════════════
class FavoritesNotifier extends StateNotifier<AsyncValue<List<FavoriteModel>>> {
  final ApiService _api;
  FavoritesNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    try {
      final favs = await _api.getFavorites();
      state = AsyncValue.data(favs);
    } catch (e, s) {
      state = AsyncValue.error(e, s);
    }
  }

  Future<bool> toggle(String productId) async {
    final res = await _api.toggleFavorite(productId);
    await load();
    return res['added'] as bool;
  }

  bool isFavorite(String productId) {
    return state.maybeWhen(
      data: (favs) => favs.any((f) => f.productId == productId),
      orElse: () => false,
    );
  }
}

final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, AsyncValue<List<FavoriteModel>>>(
      (ref) => FavoritesNotifier(ref.read(apiServiceProvider)),
    );

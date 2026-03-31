import 'package:dio/dio.dart';
import 'dio_client.dart';
import 'api_exception.dart';
import 'models.dart';

class ApiService {
  final Dio _dio = DioClient.instance;

  // ── Auth ────────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final res = await _dio.post(
        '/auth/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          if (phone != null) 'phone': phone,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return res.data;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> getMe() async {
    try {
      final res = await _dio.get('/users/me');
      return UserModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> updateMe({
    String? name,
    String? phone,
    String? address,
  }) async {
    try {
      final res = await _dio.patch(
        '/users/me',
        data: {
          if (name != null) 'name': name,
          if (phone != null) 'phone': phone,
          if (address != null) 'address': address,
        },
      );
      return UserModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Products ────────────────────────────────────────────────────────────────
  Future<ProductListResponse> getProducts({
    String? category,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _dio.get(
        '/products',
        queryParameters: {
          if (category != null) 'category': category,
          if (search != null && search.isNotEmpty) 'search': search,
          'page': page,
          'limit': limit,
        },
      );
      return ProductListResponse.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ProductModel> getProductById(String id) async {
    try {
      final res = await _dio.get('/products/$id');
      return ProductModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Cart ─────────────────────────────────────────────────────────────────────
  Future<CartModel> getCart() async {
    try {
      final res = await _dio.get('/cart');
      return CartModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CartModel> addToCart({
    required String productId,
    int quantity = 1,
  }) async {
    try {
      final res = await _dio.post(
        '/cart',
        data: {'productId': productId, 'quantity': quantity},
      );
      return CartModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CartModel> updateCartItem({
    required String itemId,
    required int quantity,
  }) async {
    try {
      final res = await _dio.patch(
        '/cart/$itemId',
        data: {'quantity': quantity},
      );
      return CartModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CartModel> removeCartItem(String itemId) async {
    try {
      final res = await _dio.delete('/cart/$itemId');
      return CartModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> clearCart() async {
    try {
      await _dio.delete('/cart');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Orders ───────────────────────────────────────────────────────────────────
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final res = await _dio.get('/orders');
      return (res.data as List).map((e) => OrderModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<OrderModel> getOrderById(String id) async {
    try {
      final res = await _dio.get('/orders/$id');
      return OrderModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<OrderModel> checkout({
    required String shippingAddress,
    String paymentMethod = 'cash_on_delivery',
    String? notes,
  }) async {
    try {
      final res = await _dio.post(
        '/orders',
        data: {
          'shippingAddress': shippingAddress,
          'paymentMethod': paymentMethod,
          if (notes != null) 'notes': notes,
        },
      );

      // ✅ CORRIGÉ — Le POST retourne les items sans product chargé.
      // On recharge la commande complète via GET /orders/:id.
      final data = res.data as Map<String, dynamic>;
      final orderId = data['id'] as String;

      try {
        return await getOrderById(orderId);
      } catch (_) {
        // Fallback si le rechargement échoue
        return OrderModel.fromJson(data);
      }
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<OrderModel> cancelOrder(String id) async {
    try {
      final res = await _dio.patch('/orders/$id/cancel');
      return OrderModel.fromJson(res.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Favorites ────────────────────────────────────────────────────────────────
  Future<List<FavoriteModel>> getFavorites() async {
    try {
      final res = await _dio.get('/favorites');
      return (res.data as List).map((e) => FavoriteModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> toggleFavorite(String productId) async {
    try {
      final res = await _dio.post('/favorites/toggle/$productId');
      return res.data;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

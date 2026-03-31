import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  factory ApiException.fromDioError(DioException e) {
    final data = e.response?.data;
    final msg = data is Map ? (data['message'] ?? 'Erreur inconnue') : 'Erreur réseau';
    return ApiException(msg.toString(), statusCode: e.response?.statusCode);
  }

  @override
  String toString() => message;
}

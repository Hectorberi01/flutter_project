class AppConstants {
  AppConstants._();

  // ── API ──────────────────────────────────────────────────────────────────
  // Android emulator  → 10.0.2.2
  // iOS simulator     → localhost ou 127.0.0.1
  // Appareil physique → IP locale de ta machine (ex: 192.168.1.x)
  // static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String baseUrl = 'https://5fc5-46-193-57-242.ngrok-free.app/api';

  // ── Storage keys ─────────────────────────────────────────────────────────
  static const String tokenKey = 'auth_token';
  static const String userKey = 'auth_user';

  // ── Pagination ────────────────────────────────────────────────────────────
  static const int pageSize = 20;
}

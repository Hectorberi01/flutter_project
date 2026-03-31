import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../api/models.dart';

// ── Formatters ────────────────────────────────────────────────────────────────
final _currencyFmt = NumberFormat.currency(locale: 'fr_FR', symbol: 'FCFA', decimalDigits: 0);
String formatPrice(double price) => _currencyFmt.format(price);

final _dateFmt = DateFormat('dd/MM/yyyy à HH:mm', 'fr_FR');
String formatDate(DateTime dt) => _dateFmt.format(dt);

// ── ProductCard ───────────────────────────────────────────────────────────────
class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback? onTap;
  final Widget? trailing;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(12)),
              child: AspectRatio(
                aspectRatio: 1,
                child: product.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: product.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => const _ShimmerBox(),
                        errorWidget: (_, __, ___) => const _PlaceholderImage(),
                      )
                    : const _PlaceholderImage(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (product.category != null)
                    Text(
                      product.category!.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        formatPrice(product.price),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      if (!product.inStock)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.error.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Rupture',
                            style: TextStyle(
                              fontSize: 10,
                              color: theme.colorScheme.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (trailing != null) ...[const SizedBox(height: 8), trailing!],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  const _PlaceholderImage();
  @override
  Widget build(BuildContext context) => Container(
        color: const Color(0xFFF1F5F9),
        child:
            const Icon(Icons.image_outlined, size: 40, color: Color(0xFFCBD5E1)),
      );
}

class _ShimmerBox extends StatelessWidget {
  const _ShimmerBox();
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: const Color(0xFFE2E8F0),
        highlightColor: const Color(0xFFF8FAFC),
        child: Container(color: Colors.white),
      );
}

// ── OrderStatusBadge ──────────────────────────────────────────────────────────
class OrderStatusBadge extends StatelessWidget {
  final String status;
  const OrderStatusBadge(this.status, {super.key});

  static const _config = {
    'pending':   {'label': 'En attente',  'color': 0xFFF59E0B, 'bg': 0xFFFEF3C7},
    'confirmed': {'label': 'Confirmée',   'color': 0xFF3B82F6, 'bg': 0xFFEFF6FF},
    'shipped':   {'label': 'Expédiée',    'color': 0xFF8B5CF6, 'bg': 0xFFF5F3FF},
    'delivered': {'label': 'Livrée',      'color': 0xFF10B981, 'bg': 0xFFECFDF5},
    'cancelled': {'label': 'Annulée',     'color': 0xFFEF4444, 'bg': 0xFFFEF2F2},
  };

  @override
  Widget build(BuildContext context) {
    final cfg = _config[status] ?? {'label': status, 'color': 0xFF64748B, 'bg': 0xFFF1F5F9};
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Color(cfg['bg'] as int),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        cfg['label'] as String,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Color(cfg['color'] as int),
        ),
      ),
    );
  }
}

// ── LoadingWidget ─────────────────────────────────────────────────────────────
class LoadingWidget extends StatelessWidget {
  const LoadingWidget({super.key});
  @override
  Widget build(BuildContext context) => const Center(
        child: CircularProgressIndicator(),
      );
}

// ── ErrorWidget ───────────────────────────────────────────────────────────────
class AppErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  const AppErrorWidget({super.key, required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 12),
              Text(message, textAlign: TextAlign.center),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                ElevatedButton(onPressed: onRetry, child: const Text('Réessayer')),
              ]
            ],
          ),
        ),
      );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
class EmptyStateWidget extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;
  const EmptyStateWidget({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 64, color: const Color(0xFFCBD5E1)),
              const SizedBox(height: 16),
              Text(title,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w600)),
              if (subtitle != null) ...[
                const SizedBox(height: 8),
                Text(subtitle!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF64748B))),
              ],
              if (action != null) ...[const SizedBox(height: 24), action!],
            ],
          ),
        ),
      );
}

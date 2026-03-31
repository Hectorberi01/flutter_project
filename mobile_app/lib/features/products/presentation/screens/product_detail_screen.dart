import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class ProductDetailScreen extends ConsumerWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(productDetailProvider(productId));

    return productAsync.when(
      loading: () => const Scaffold(body: LoadingWidget()),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: AppErrorWidget(message: e.toString()),
      ),
      data: (product) {
        final isFav = ref.watch(favoritesProvider).maybeWhen(
              data: (favs) => favs.any((f) => f.productId == productId),
              orElse: () => false,
            );

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                actions: [
                  IconButton(
                    icon: Icon(
                        isFav ? Icons.favorite : Icons.favorite_outline,
                        color: isFav ? Colors.red : null),
                    onPressed: () async {
                      await ref
                          .read(favoritesProvider.notifier)
                          .toggle(productId);
                    },
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: product.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: product.imageUrl!,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) =>
                              Container(color: const Color(0xFFF1F5F9)),
                        )
                      : Container(
                          color: const Color(0xFFF1F5F9),
                          child: const Icon(Icons.image_outlined,
                              size: 80, color: Color(0xFFCBD5E1)),
                        ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (product.category != null)
                        Text(
                          product.category!.toUpperCase(),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                            letterSpacing: 1,
                          ),
                        ),
                      const SizedBox(height: 8),
                      Text(product.name,
                          style: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            formatPrice(product.price),
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: product.inStock
                                  ? const Color(0xFFECFDF5)
                                  : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              product.inStock
                                  ? '${product.stock} en stock'
                                  : 'Rupture de stock',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: product.inStock
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFEF4444),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (product.description != null) ...[
                        const SizedBox(height: 24),
                        const Text('Description',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Text(
                          product.description!,
                          style: const TextStyle(
                              color: Color(0xFF475569), height: 1.6),
                        ),
                      ],
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: product.inStock
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Color(0x10000000), blurRadius: 8)],
                  ),
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.shopping_cart_outlined),
                    label: const Text('Ajouter au panier'),
                    onPressed: () async {
                      try {
                        await ref
                            .read(cartProvider.notifier)
                            .addItem(productId);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product.name} ajouté au panier'),
                              backgroundColor:
                                  Theme.of(context).colorScheme.primary,
                              behavior: SnackBarBehavior.floating,
                              action: SnackBarAction(
                                label: 'Voir',
                                textColor: Colors.white,
                                onPressed: () => context.push('/cart'),
                              ),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(e.toString()),
                              backgroundColor:
                                  Theme.of(context).colorScheme.error,
                            ),
                          );
                        }
                      }
                    },
                  ),
                )
              : null,
        );
      },
    );
  }
}

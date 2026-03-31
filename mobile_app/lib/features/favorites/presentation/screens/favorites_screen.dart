import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favsAsync = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mes favoris')),
      body: favsAsync.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorWidget(
          message: e.toString(),
          onRetry: () => ref.read(favoritesProvider.notifier).load(),
        ),
        data: (favs) {
          if (favs.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.favorite_outline,
              title: 'Aucun favori',
              subtitle: 'Ajoutez des produits à vos favoris pour les retrouver facilement',
              action: ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Parcourir les produits'),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(favoritesProvider.notifier).load(),
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favs.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.68,
              ),
              itemBuilder: (_, i) {
                final fav = favs[i];
                return Stack(
                  children: [
                    ProductCard(
                      product: fav.product,
                      onTap: () => context.push('/home/product/${fav.productId}'),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: () async {
                          await ref
                              .read(favoritesProvider.notifier)
                              .toggle(fav.productId);
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                  color: Color(0x20000000), blurRadius: 4)
                            ],
                          ),
                          child: const Icon(Icons.favorite,
                              color: Colors.red, size: 18),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }
}

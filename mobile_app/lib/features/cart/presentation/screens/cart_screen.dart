import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon panier'),
        actions: [
          cartAsync.maybeWhen(
            data: (cart) => cart != null && cart.items.isNotEmpty
                ? TextButton(
                    onPressed: () async {
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (_) => AlertDialog(
                          title: const Text('Vider le panier'),
                          content: const Text('Confirmer ?'),
                          actions: [
                            TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: const Text('Annuler')),
                            TextButton(
                                onPressed: () => Navigator.pop(context, true),
                                child: const Text('Vider',
                                    style: TextStyle(color: Colors.red))),
                          ],
                        ),
                      );
                      if (ok == true) {
                        await ref.read(cartProvider.notifier).clear();
                      }
                    },
                    child: const Text('Vider'),
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: cartAsync.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorWidget(
            message: e.toString(),
            onRetry: () => ref.read(cartProvider.notifier).load()),
        data: (cart) {
          if (cart == null || cart.items.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.shopping_cart_outlined,
              title: 'Panier vide',
              subtitle: 'Ajoutez des produits pour commencer',
              action: ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Parcourir les produits'),
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final item = cart.items[i];
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: SizedBox(
                                width: 72,
                                height: 72,
                                child: item.product.imageUrl != null
                                    ? Image.network(item.product.imageUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            Container(color: const Color(0xFFF1F5F9)))
                                    : Container(color: const Color(0xFFF1F5F9),
                                        child: const Icon(Icons.image_outlined)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.product.name,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 4),
                                  Text(formatPrice(item.product.price),
                                      style: TextStyle(
                                          color: Theme.of(context).colorScheme.primary,
                                          fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      _QtyButton(
                                        icon: Icons.remove,
                                        onTap: () {
                                          if (item.quantity > 1) {
                                            ref.read(cartProvider.notifier)
                                                .updateItem(item.id, item.quantity - 1);
                                          } else {
                                            ref.read(cartProvider.notifier)
                                                .removeItem(item.id);
                                          }
                                        },
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: Text('${item.quantity}',
                                            style: const TextStyle(
                                                fontSize: 16, fontWeight: FontWeight.w700)),
                                      ),
                                      _QtyButton(
                                        icon: Icons.add,
                                        onTap: () {
                                          ref.read(cartProvider.notifier)
                                              .updateItem(item.id, item.quantity + 1);
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444)),
                                  onPressed: () =>
                                      ref.read(cartProvider.notifier).removeItem(item.id),
                                ),
                                Text(formatPrice(item.subtotal),
                                    style: const TextStyle(fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Total + checkout
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Color(0x10000000), blurRadius: 8)],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                        Text(formatPrice(cart.total),
                            style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).colorScheme.primary)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.push('/checkout'),
                      child: Text('Commander (${cart.itemCount} article${cart.itemCount > 1 ? 's' : ''})'),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16),
        ),
      );
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String _paymentMethod = 'cash_on_delivery';
  bool _isLoading = false;

  static const _paymentOptions = [
    {'value': 'cash_on_delivery', 'label': 'Paiement à la livraison', 'icon': Icons.money},
    {'value': 'mobile_money', 'label': 'Mobile Money', 'icon': Icons.phone_android},
    {'value': 'card', 'label': 'Carte bancaire', 'icon': Icons.credit_card},
    {'value': 'bank_transfer', 'label': 'Virement bancaire', 'icon': Icons.account_balance},
  ];

  @override
  void dispose() {
    _addressCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final order = await ref.read(ordersProvider.notifier).checkout(
            shippingAddress: _addressCtrl.text.trim(),
            paymentMethod: _paymentMethod,
            notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text.trim(),
          );
      await ref.read(cartProvider.notifier).load();
      if (mounted) {
        context.go('/orders/${order.id}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Commande ${order.reference} passée avec succès !'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(e.toString()),
              backgroundColor: Theme.of(context).colorScheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Finaliser la commande')),
      body: cartAsync.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorWidget(message: e.toString()),
        data: (cart) {
          if (cart == null || cart.items.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.shopping_cart_outlined,
              title: 'Panier vide',
              action: ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Parcourir'),
              ),
            );
          }
          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Récap commande
                const Text('Récapitulatif',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        ...cart.items.map((item) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                children: [
                                  Expanded(
                                      child: Text(
                                          '${item.product.name} × ${item.quantity}',
                                          style: const TextStyle(fontSize: 13))),
                                  Text(formatPrice(item.subtotal),
                                      style: const TextStyle(fontWeight: FontWeight.w600)),
                                ],
                              ),
                            )),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                            Text(formatPrice(cart.total),
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 18,
                                    color: Theme.of(context).colorScheme.primary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Adresse livraison
                const Text('Adresse de livraison',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _addressCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: '123 Rue du Commerce, Cotonou, Bénin',
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 40),
                      child: Icon(Icons.location_on_outlined),
                    ),
                  ),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Adresse requise' : null,
                ),
                const SizedBox(height: 24),

                // Mode de paiement
                const Text('Mode de paiement',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                ..._paymentOptions.map((opt) => RadioListTile<String>(
                      value: opt['value'] as String,
                      groupValue: _paymentMethod,
                      onChanged: (v) => setState(() => _paymentMethod = v!),
                      title: Text(opt['label'] as String),
                      secondary: Icon(opt['icon'] as IconData),
                      contentPadding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    )),
                const SizedBox(height: 16),

                // Notes
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    hintText: 'Instructions de livraison (optionnel)',
                    prefixIcon: Icon(Icons.note_outlined),
                  ),
                ),
                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: _isLoading ? null : _placeOrder,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : Text('Confirmer — ${formatPrice(cart.total)}'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

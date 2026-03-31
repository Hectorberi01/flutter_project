import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_service.dart';
import '../../../../core/api/models.dart';
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(_orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Détail commande')),
      body: orderAsync.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorWidget(message: e.toString()),
        data: (order) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // En-tête
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(order.reference,
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.w700)),
                        OrderStatusBadge(order.status),
                      ],
                    ),
                    const Divider(height: 20),
                    _InfoRow(
                        label: 'Date', value: formatDate(order.createdAt)),
                    _InfoRow(
                        label: 'Paiement',
                        value: _paymentLabel(order.paymentMethod)),
                    _InfoRow(
                        label: 'Statut paiement',
                        value: _paymentStatusLabel(order.paymentStatus)),
                    if (order.shippingAddress != null)
                      _InfoRow(label: 'Adresse', value: order.shippingAddress!),
                    if (order.notes != null)
                      _InfoRow(label: 'Notes', value: order.notes!),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Articles
            const Text('Articles',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            ...order.items.map((item) => Card(
                  child: ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: SizedBox(
                        width: 52,
                        height: 52,
                        child: item.product.imageUrl != null
                            ? Image.network(item.product.imageUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    Container(color: const Color(0xFFF1F5F9)))
                            : Container(color: const Color(0xFFF1F5F9)),
                      ),
                    ),
                    title: Text(item.product.name,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(
                        '${formatPrice(item.unitPrice)} × ${item.quantity}'),
                    trailing: Text(formatPrice(item.subtotal),
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                  ),
                )),
            const SizedBox(height: 16),

            // Total
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total',
                        style:
                            TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    Text(formatPrice(order.totalAmount),
                        style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Theme.of(context).colorScheme.primary)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Annulation
            if (['pending', 'confirmed'].contains(order.status))
              OutlinedButton.icon(
                icon: const Icon(Icons.cancel_outlined, color: Color(0xFFEF4444)),
                label: const Text('Annuler la commande',
                    style: TextStyle(color: Color(0xFFEF4444))),
                style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFEF4444))),
                onPressed: () async {
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Annuler la commande'),
                      content:
                          const Text('Cette action est irréversible. Confirmer ?'),
                      actions: [
                        TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text('Non')),
                        TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: const Text('Oui, annuler',
                                style: TextStyle(color: Colors.red))),
                      ],
                    ),
                  );
                  if (ok == true && context.mounted) {
                    await ref.read(ordersProvider.notifier).cancel(orderId);
                    ref.invalidate(_orderDetailProvider(orderId));
                  }
                },
              ),
          ],
        ),
      ),
    );
  }

  String _paymentLabel(String method) {
    const map = {
      'cash_on_delivery': 'Paiement à la livraison',
      'mobile_money': 'Mobile Money',
      'card': 'Carte bancaire',
      'bank_transfer': 'Virement bancaire',
    };
    return map[method] ?? method;
  }

  String _paymentStatusLabel(String status) {
    const map = {
      'unpaid': 'Non payé',
      'paid': 'Payé',
      'refunded': 'Remboursé',
    };
    return map[status] ?? status;
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 110,
              child: Text(label,
                  style: const TextStyle(color: Color(0xFF94A3B8))),
            ),
            Expanded(
              child: Text(value,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      );
}

// Provider local pour le détail d'une commande
final _orderDetailProvider =
    FutureProvider.family<OrderModel, String>((ref, id) {
  return ref.read(apiServiceProvider).getOrderById(id);
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => _showEditSheet(context, ref),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Avatar
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                  ),
                ),
                const SizedBox(height: 12),
                Text(user.name,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(user.email,
                    style: const TextStyle(color: Color(0xFF64748B))),
                if (user.isAdmin) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Administrateur',
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 12),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Infos
          const _SectionTitle('Informations'),
          _InfoTile(
              icon: Icons.person_outline,
              label: 'Nom',
              value: user.name),
          _InfoTile(
              icon: Icons.email_outlined,
              label: 'Email',
              value: user.email),
          _InfoTile(
              icon: Icons.phone_outlined,
              label: 'Téléphone',
              value: user.phone ?? 'Non renseigné'),
          _InfoTile(
              icon: Icons.location_on_outlined,
              label: 'Adresse',
              value: user.address ?? 'Non renseignée'),

          const SizedBox(height: 24),
          const _SectionTitle('Actions'),

          // Mes commandes
          _ActionTile(
            icon: Icons.receipt_long_outlined,
            label: 'Mes commandes',
            onTap: () => context.push('/orders'),
          ),
          _ActionTile(
            icon: Icons.favorite_outline,
            label: 'Mes favoris',
            onTap: () => context.push('/favorites'),
          ),
          _ActionTile(
            icon: Icons.shopping_cart_outlined,
            label: 'Mon panier',
            onTap: () => context.push('/cart'),
          ),

          const SizedBox(height: 24),

          // Déconnexion
          OutlinedButton.icon(
            icon:
                const Icon(Icons.logout, color: Color(0xFFEF4444)),
            label: const Text('Se déconnecter',
                style: TextStyle(color: Color(0xFFEF4444))),
            style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFEF4444))),
            onPressed: () async {
              final ok = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Déconnexion'),
                  content: const Text('Confirmer la déconnexion ?'),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Annuler')),
                    TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('Déconnecter',
                            style: TextStyle(color: Colors.red))),
                  ],
                ),
              );
              if (ok == true && context.mounted) {
                await ref.read(authProvider.notifier).logout();
                context.go('/login');
              }
            },
          ),
        ],
      ),
    );
  }

  void _showEditSheet(BuildContext context, WidgetRef ref) {
    final user = ref.read(authProvider).user!;
    final nameCtrl = TextEditingController(text: user.name);
    final phoneCtrl = TextEditingController(text: user.phone ?? '');
    final addressCtrl = TextEditingController(text: user.address ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Modifier le profil',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(
                  labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                  labelText: 'Téléphone',
                  prefixIcon: Icon(Icons.phone_outlined)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: addressCtrl,
              decoration: const InputDecoration(
                  labelText: 'Adresse',
                  prefixIcon: Icon(Icons.location_on_outlined)),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () async {
                await ref.read(authProvider.notifier).updateProfile(
                      name: nameCtrl.text.trim(),
                      phone: phoneCtrl.text.isEmpty
                          ? null
                          : phoneCtrl.text.trim(),
                      address: addressCtrl.text.isEmpty
                          ? null
                          : addressCtrl.text.trim(),
                    );
                if (ctx.mounted) Navigator.pop(ctx);
              },
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(title,
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1E293B))),
      );
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
          title: Text(label,
              style: const TextStyle(
                  fontSize: 12, color: Color(0xFF94A3B8))),
          subtitle: Text(value,
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1E293B))),
        ),
      );
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionTile(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
          title: Text(label,
              style: const TextStyle(fontWeight: FontWeight.w600)),
          trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
          onTap: onTap,
        ),
      );
}

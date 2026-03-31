import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import '../../../../core/api/providers.dart';
import '../../../../core/utils/widgets.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _navIndex = 0;
  final _searchCtrl = TextEditingController();

  static const _categories = [
    'Tous', 'Vêtements', 'Électronique', 'Alimentation',
    'Maison', 'Beauté', 'Sport',
  ];
  String _selectedCat = 'Tous';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = ref.watch(cartItemCountProvider);

    return Scaffold(
      body: IndexedStack(
        index: _navIndex,
        children: const [
          _CatalogTab(),
          _FavoritesTabPlaceholder(),
          _OrdersTabPlaceholder(),
          _ProfileTabPlaceholder(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _navIndex,
        onTap: (i) {
          if (i == 0) { setState(() => _navIndex = 0); return; }
          if (i == 1) { context.push('/favorites'); return; }
          if (i == 2) { context.push('/orders'); return; }
          if (i == 3) { context.push('/profile'); return; }
        },
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Accueil',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.favorite_outline),
            activeIcon: Icon(Icons.favorite),
            label: 'Favoris',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Commandes',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
      floatingActionButton: cartCount > 0
          ? FloatingActionButton(
              onPressed: () => context.push('/cart'),
              child: badges.Badge(
                badgeContent: Text('$cartCount',
                    style: const TextStyle(color: Colors.white, fontSize: 10)),
                child: const Icon(Icons.shopping_cart_outlined),
              ),
            )
          : null,
    );
  }
}

class _CatalogTab extends ConsumerStatefulWidget {
  const _CatalogTab();

  @override
  ConsumerState<_CatalogTab> createState() => _CatalogTabState();
}

class _CatalogTabState extends ConsumerState<_CatalogTab> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  String _selectedCat = 'Tous';

  static const _categories = [
    'Tous', 'Vêtements', 'Électronique', 'Alimentation',
    'Maison', 'Beauté', 'Sport',
  ];

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >=
          _scrollCtrl.position.maxScrollExtent - 200) {
        final products = ref.read(productsProvider);
        if (products.hasMore && !products.isLoading) {
          ref.read(productsProvider.notifier).load();
        }
      }
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider);
    final user = ref.watch(authProvider).user;

    return SafeArea(
      child: CustomScrollView(
        controller: _scrollCtrl,
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Bonjour, ${user?.name.split(' ').first ?? ''}',
                              style: const TextStyle(
                                  fontSize: 22, fontWeight: FontWeight.w700)),
                          const Text('Que cherchez-vous ?',
                              style: TextStyle(color: Color(0xFF64748B))),
                        ],
                      ),
                      IconButton(
                        onPressed: () => context.push('/cart'),
                        icon: const Icon(Icons.shopping_cart_outlined),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Recherche
                  TextField(
                    controller: _searchCtrl,
                    onSubmitted: (v) {
                      ref.read(productsProvider.notifier).search(v);
                    },
                    decoration: InputDecoration(
                      hintText: 'Rechercher un produit...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchCtrl.clear();
                                ref.read(productsProvider.notifier).search('');
                              },
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Catégories
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (_, i) {
                        final cat = _categories[i];
                        final selected = _selectedCat == cat;
                        return FilterChip(
                          label: Text(cat),
                          selected: selected,
                          onSelected: (_) {
                            setState(() => _selectedCat = cat);
                            ref
                                .read(productsProvider.notifier)
                                .filterByCategory(
                                    cat == 'Tous' ? null : cat);
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Grille produits
          if (products.isLoading && products.products.isEmpty)
            const SliverFillRemaining(child: LoadingWidget())
          else if (products.error != null && products.products.isEmpty)
            SliverFillRemaining(
              child: AppErrorWidget(
                message: products.error!,
                onRetry: () =>
                    ref.read(productsProvider.notifier).refresh(),
              ),
            )
          else if (products.products.isEmpty)
            const SliverFillRemaining(
              child: EmptyStateWidget(
                icon: Icons.search_off,
                title: 'Aucun produit trouvé',
                subtitle: 'Essayez d\'autres mots-clés',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                delegate: SliverChildBuilderDelegate(
                  (_, i) {
                    if (i == products.products.length) {
                      return products.isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : const SizedBox.shrink();
                    }
                    final p = products.products[i];
                    return ProductCard(
                      product: p,
                      onTap: () => context.push('/home/product/${p.id}'),
                    );
                  },
                  childCount: products.products.length +
                      (products.isLoading ? 1 : 0),
                ),
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.68,
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }
}

// Placeholders pour la navigation — les vraies pages sont dans leurs fichiers
class _FavoritesTabPlaceholder extends StatelessWidget {
  const _FavoritesTabPlaceholder();
  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

class _OrdersTabPlaceholder extends StatelessWidget {
  const _OrdersTabPlaceholder();
  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

class _ProfileTabPlaceholder extends StatelessWidget {
  const _ProfileTabPlaceholder();
  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

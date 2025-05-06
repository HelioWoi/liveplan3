import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Star,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit3,
  Share2,
  Settings,
  PieChart,
  Calendar,
  Tag
} from 'lucide-react';
interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
  action: () => void;
  shortcut?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ContextMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);


  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('menuFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('menuFavorites', JSON.stringify(newFavorites));
  };

  const getContextualMenuSections = (): MenuSection[] => {
    const path = location.pathname;
    
    // Menu items específicos para cada página
    if (path === '/transactions' || path.startsWith('/transactions/')) {
      return [
        {
          title: 'Ações',
          items: [
            {
              id: 'filter_transactions',
              label: 'Filtrar',
              icon: <Filter className="h-4 w-4" />,
              action: () => {/* Implementar filtro */},
              shortcut: '⌘F'
            },
            {
              id: 'export_transactions',
              label: 'Exportar',
              icon: <Download className="h-4 w-4" />,
              action: () => {/* Implementar exportação */},
              shortcut: '⌘E'
            },
            {
              id: 'import_transactions',
              label: 'Importar',
              icon: <Upload className="h-4 w-4" />,
              action: () => {/* Implementar importação */},
              shortcut: '⌘I'
            }
          ]
        },
        {
          title: 'Visualização',
          items: [
            {
              id: 'group_by_category',
              label: 'Agrupar por Categoria',
              icon: <Tag className="h-4 w-4" />,
              action: () => {/* Implementar agrupamento */}
            },
            {
              id: 'view_calendar',
              label: 'Visualizar Calendário',
              icon: <Calendar className="h-4 w-4" />,
              action: () => {/* Implementar visualização */}
            }
          ]
        }
      ];
    }

    if (path === '/dashboard') {
      return [
        {
          title: 'Análises',
          items: [
            {
              id: 'view_reports',
              label: 'Relatórios',
              icon: <PieChart className="h-4 w-4" />,
              action: () => navigate('/reports'),
              shortcut: '⌘R'
            },
            {
              id: 'share_dashboard',
              label: 'Compartilhar',
              icon: <Share2 className="h-4 w-4" />,
              action: () => {/* Implementar compartilhamento */}
            }
          ]
        }
      ];
    }

    if (path === '/goals') {
      return [
        {
          title: 'Metas',
          items: [
            {
              id: 'edit_goals',
              label: 'Editar Metas',
              icon: <Edit3 className="h-4 w-4" />,
              action: () => {/* Implementar edição */},
              shortcut: '⌘E'
            },
            {
              id: 'archive_completed',
              label: 'Arquivar Concluídas',
              icon: <Trash2 className="h-4 w-4" />,
              action: () => {/* Implementar arquivamento */}
            }
          ]
        }
      ];
    }

    // Menu padrão para outras páginas
    return [
      {
        title: 'Geral',
        items: [
          {
            id: 'settings',
            label: 'Configurações',
            icon: <Settings className="h-4 w-4" />,
            action: () => navigate('/settings')
          }
        ]
      }
    ];
  };

  const menuSections = getContextualMenuSections();

  // Adiciona seção de favoritos se houver itens favoritados
  const allItems = menuSections.flatMap(section => section.items);
  const favoriteItems = allItems.filter(item => favorites.includes(item.id));
  
  if (favoriteItems.length > 0) {
    menuSections.unshift({
      title: 'Favoritos',
      items: favoriteItems
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar o menu ao clicar fora */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu contextual */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-50 py-2">
            {menuSections.map((section, index) => (
              <div key={section.title} className="px-2">
                {index > 0 && <hr className="my-2" />}
                <p className="text-xs text-gray-500 px-3 py-1">{section.title}</p>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.shortcut && (
                        <span className="text-xs text-gray-400">
                          {item.shortcut}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          favorites.includes(item.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

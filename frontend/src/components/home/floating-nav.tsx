import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

const FloatingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Jobs', href: '/jobs' },
    { name: 'About', href: '/about' },
    { name: 'Team', href: '/torem' },
    { name: 'Features', href: '/lorem' },
  ];

  const displayName =
    user?.email?.split('@')[0] && user.email.split('@')[0].length > 0
      ? user.email.split('@')[0]
      : 'User';

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'company'
        ? '/company'
        : '/graduate';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="relative backdrop-blur-xl border border-white/20 shadow-2xl text-inter bg-[#00000033] rounded-3xl py-4">
            <div className="relative flex items-center justify-between px-6">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <img
                    src="/RecruitaGreenBlack.svg"
                    alt="Recruita Logo"
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative group px-4 py-2 text-gray-700 font-medium transition-all duration-300"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-linear-to-r from-fade to-button group-hover:w-full group-hover:left-0 transition-all"></div>
                    <div className="absolute -top-1 left-1/2 w-1 h-1 bg-button rounded-full opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-all"></div>
                  </Link>
                ))}
              </div>

              {/* Icons / Profile / Mobile Menu Trigger */}
              <div className="flex items-center space-x-3">
                {/* Desktop: Profile / Register */}
                <div className="hidden lg:block">
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="flex w-[32px] h-[32px] rounded-[8px] bg-linear-to-br from-orange-400 to-orange-500 items-center justify-center text-white font-semibold text-[14px] shadow-sm hover:shadow-md transition-shadow">
                          {displayName.charAt(0).toUpperCase()}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuLabel className="truncate">
                          {displayName}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link className="w-full" to={dashboardPath}>
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link to="/register">
                      <button className="py-[13px] px-[54px] text-[#1C1C1C] bg-[#ADED9A] flex rounded-xl">
                        Register
                      </button>
                    </Link>
                  )}
                </div>

                {/* Mobile: Hamburger – opens full-screen menu */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 rounded-xl bg-white/10 border border-white/20 text-gray-800 hover:bg-white/20 transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="w-6 h-6" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile: Full-screen slide-in menu */}
      <div
        className="lg:hidden fixed inset-0 z-100 transition-opacity duration-300"
        style={{ pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center"
            >
              <img
                src="/RecruitaGreenBlack.svg"
                alt="Recruita"
                className="h-7 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-6 px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-3">
              Menu
            </p>
            <ul className="space-y-0.5">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[#1C1C1C] font-medium hover:bg-[#ADED9A]/20 active:bg-[#ADED9A]/30 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-200">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <span className="block px-4 py-3 rounded-xl text-[#1C1C1C] font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors text-center border border-gray-200">
                      Login
                    </span>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <span className="block px-4 py-3 rounded-xl text-white font-medium bg-[#ADED9A] hover:opacity-90 active:opacity-95 transition-opacity text-center">
                      Register
                    </span>
                  </Link>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to={dashboardPath}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-xl text-[#1C1C1C] font-medium hover:bg-[#ADED9A]/20 active:bg-[#ADED9A]/30 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default FloatingNavbar;

import React, { useState } from 'react';
import { Music, LayoutDashboard, Mic2, Circle, Grid, LogIn, Menu, X, ArrowRight } from 'lucide-react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import Tuner from './components/tools/Tuner';
import Profelofono from './components/tools/Profelofono';
import CircleOfFifths from './components/tools/CircleOfFifths';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView(AppView.DASHBOARD);
  };

  const NavLink = ({ view, label, icon: Icon }: { view: AppView, label: string, icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView(AppView.LANDING)}>
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Music className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800 block leading-none">Sergio Alfaro</span>
                <span className="text-xs text-slate-500 font-medium tracking-wider">ACADEMIA MUSICAL</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink view={AppView.LANDING} label="Inicio" icon={Grid} />
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <NavLink view={AppView.TOOL_PROFELOFONO} label="Profelófono" icon={Grid} />
              <NavLink view={AppView.TOOL_TUNER} label="Afinador" icon={Mic2} />
              <NavLink view={AppView.TOOL_CIRCLE} label="Círculo 5tas" icon={Circle} />
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              
              {isLoggedIn ? (
                <NavLink view={AppView.DASHBOARD} label="Mi Academia" icon={LayoutDashboard} />
              ) : (
                <button 
                  onClick={() => setCurrentView(AppView.LOGIN)}
                  className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <LogIn size={16} /> Profesor
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg">
             <NavLink view={AppView.LANDING} label="Inicio" icon={Grid} />
             <NavLink view={AppView.TOOL_PROFELOFONO} label="Profelófono" icon={Grid} />
             <NavLink view={AppView.TOOL_TUNER} label="Afinador" icon={Mic2} />
             <NavLink view={AppView.TOOL_CIRCLE} label="Círculo de Quintas" icon={Circle} />
             <hr className="border-slate-100 my-2"/>
             {isLoggedIn ? (
                <NavLink view={AppView.DASHBOARD} label="Mi Academia" icon={LayoutDashboard} />
              ) : (
                <button 
                  onClick={() => {setCurrentView(AppView.LOGIN); setIsMobileMenuOpen(false);}}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  <LogIn size={18} /> Acceso Profesor
                </button>
              )}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === AppView.LANDING && (
          <div>
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                  Descubre tu <span className="text-blue-500">Música</span>
                </h1>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Bienvenido a la plataforma educativa del profesor Sergio Alfaro (salfaro.cl). 
                  Herramientas interactivas, recursos exclusivos y una metodología innovadora para potenciar tu talento.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setCurrentView(AppView.TOOL_PROFELOFONO)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50"
                  >
                    Probar Herramientas
                  </button>
                  <button 
                    onClick={() => setCurrentView(AppView.LOGIN)} // Assuming this leads to register info or similar
                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-slate-700 transition-all"
                  >
                    Unirse a la Academia
                  </button>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">Herramientas Gratuitas</h2>
                  <p className="text-slate-500">Recursos disponibles para todo estudiante de música</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div 
                    onClick={() => setCurrentView(AppView.TOOL_PROFELOFONO)}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Grid size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">El Profelófono</h3>
                    <p className="text-slate-500 mb-4">Emulación exacta del instrumento utilizado en clases. Practica melodías visualmente con colores educativos.</p>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Ir a practicar <ArrowRight size={16}/></span>
                  </div>

                  <div 
                    onClick={() => setCurrentView(AppView.TOOL_TUNER)}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Mic2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Afinador Cromático</h3>
                    <p className="text-slate-500 mb-4">Asegura que tu instrumento suene perfecto. Detección de pitch en tiempo real vía micrófono.</p>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Ir a afinar <ArrowRight size={16}/></span>
                  </div>

                  <div 
                    onClick={() => setCurrentView(AppView.TOOL_CIRCLE)}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Circle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Círculo de Quintas</h3>
                    <p className="text-slate-500 mb-4">Comprende las armaduras, escalas y relaciones entre acordes de forma interactiva.</p>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Ir a estudiar <ArrowRight size={16}/></span>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Video / About Section */}
            <section className="py-20 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-video bg-slate-200 group cursor-pointer">
                     {/* Placeholder for video */}
                     <img src="https://picsum.photos/800/450?grayscale" alt="Music Class" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition-transform">
                         <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-blue-600 border-b-[10px] border-b-transparent ml-1"></div>
                       </div>
                     </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">Aprende con Sergio Alfaro</h2>
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                    La música no solo es teoría, es sentimiento y práctica. En nuestra academia, integramos la tecnología con la pedagogía tradicional para ofrecerte una experiencia de aprendizaje completa.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {['Clases personalizadas', 'Material de apoyo exclusivo', 'Seguimiento continuo', 'Comunidad de estudiantes'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">✓</div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === AppView.LOGIN && (
          <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="text-white w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Acceso Profesor</h2>
                <p className="text-slate-500">Ingresa tus credenciales para gestionar la academia</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="admin" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                  <input type="password" className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="••••••" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10">
                  Ingresar
                </button>
              </form>
              <div className="mt-6 text-center">
                 <button onClick={() => setCurrentView(AppView.LANDING)} className="text-sm text-slate-500 hover:text-slate-800">Volver al inicio</button>
              </div>
            </div>
          </div>
        )}

        {currentView === AppView.DASHBOARD && <Dashboard />}

        {/* Tool Containers */}
        {(currentView === AppView.TOOL_PROFELOFONO || currentView === AppView.TOOL_TUNER || currentView === AppView.TOOL_CIRCLE) && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <button 
              onClick={() => setCurrentView(AppView.LANDING)}
              className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              ← Volver al inicio
            </button>
            {currentView === AppView.TOOL_PROFELOFONO && <Profelofono />}
            {currentView === AppView.TOOL_TUNER && <Tuner />}
            {currentView === AppView.TOOL_CIRCLE && <CircleOfFifths />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center sm:text-left grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">Sergio Alfaro</h3>
            <p className="mb-4 max-w-sm">
              Plataforma educativa musical diseñada para potenciar el aprendizaje en el aula y en casa.
            </p>
            <p className="text-sm">© 2024 salfaro.cl. Todos los derechos reservados.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Herramientas</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView(AppView.TOOL_PROFELOFONO)}>Profelófono</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView(AppView.TOOL_TUNER)}>Afinador</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView(AppView.TOOL_CIRCLE)}>Círculo de Quintas</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>contacto@salfaro.cl</li>
              <li>Santiago, Chile</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

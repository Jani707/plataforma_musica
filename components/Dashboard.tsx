import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Trash2, BookOpen, Music, Wand2, User } from 'lucide-react';
import { generateLessonPlan } from '../services/geminiService';

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Ana Pérez', email: 'ana@example.com', instrument: 'Piano', level: 'Intermedio', joinedDate: '2024-01-15' },
  { id: '2', name: 'Carlos Díaz', email: 'carlos@example.com', instrument: 'Guitarra', level: 'Principiante', joinedDate: '2024-03-10' },
  { id: '3', name: 'Lucía Silva', email: 'lucia@example.com', instrument: 'Flauta', level: 'Avanzado', joinedDate: '2023-11-05' },
];

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', instrument: '', level: 'Principiante' });
  
  // AI Feature State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [aiLessonPlan, setAiLessonPlan] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...newStudent,
      joinedDate: new Date().toISOString().split('T')[0],
      level: newStudent.level as any
    };
    setStudents([...students, student]);
    setIsModalOpen(false);
    setNewStudent({ name: '', email: '', instrument: '', level: 'Principiante' });
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleGenerateAI = async () => {
    if (!selectedStudentId || !lessonTopic) return;
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setIsGenerating(true);
    const plan = await generateLessonPlan(student.name, student.instrument, student.level, lessonTopic);
    setAiLessonPlan(plan);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Profesor</h1>
          <p className="text-slate-500">Gestión de Academia Musical Sergio Alfaro</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={20} /> Nuevo Estudiante
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <User size={18} /> Estudiantes Activos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Instrumento</th>
                  <th className="px-6 py-3">Nivel</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4">{student.instrument}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${student.level === 'Principiante' ? 'bg-green-100 text-green-800' : 
                          student.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-purple-100 text-purple-800'}`}>
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button 
                        onClick={() => setSelectedStudentId(student.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Planificar Lección"
                      >
                        <Wand2 size={18} />
                      </button>
                      <button 
                        onClick={() => removeStudent(student.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No hay estudiantes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
           <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
            <h2 className="font-semibold flex items-center gap-2">
              <Wand2 size={18} /> Asistente IA de Clases
            </h2>
            <p className="text-xs text-indigo-100 mt-1">Impulsado por Gemini</p>
          </div>
          
          <div className="p-6 flex flex-col gap-4 flex-1">
            {!selectedStudentId ? (
              <div className="text-center text-slate-400 my-auto">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Selecciona un estudiante de la lista para generar un plan de práctica.</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
                  <span className="text-xs text-slate-500 uppercase">Estudiante seleccionado:</span>
                  <p className="font-semibold text-slate-800">
                    {students.find(s => s.id === selectedStudentId)?.name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de la clase</label>
                  <input 
                    type="text" 
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="Ej. Escala de Sol Mayor, Ritmo en 6/8..."
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !lessonTopic}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  {isGenerating ? 'Generando...' : 'Generar Plan'}
                </button>

                {aiLessonPlan && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto font-mono leading-relaxed">
                    {aiLessonPlan}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Agregar Nuevo Estudiante</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input 
                  required
                  type="text" 
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input 
                  required
                  type="email" 
                  value={newStudent.email}
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Instrumento</label>
                  <input 
                    required
                    type="text" 
                    value={newStudent.instrument}
                    onChange={e => setNewStudent({...newStudent, instrument: e.target.value})}
                    className="w-full border rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Nivel</label>
                   <select 
                      value={newStudent.level}
                      onChange={e => setNewStudent({...newStudent, level: e.target.value})}
                      className="w-full border rounded-lg p-2 mt-1"
                   >
                     <option>Principiante</option>
                     <option>Intermedio</option>
                     <option>Avanzado</option>
                   </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

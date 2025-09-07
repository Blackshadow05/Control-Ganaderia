'use client'

export default function DeleteCattleButton() {
  const handleClick = (e: React.FormEvent) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de ganado? Esta acción no se puede deshacer.')) {
      e.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      onClick={handleClick}
    >
      Eliminar Ganado
    </button>
  );
}
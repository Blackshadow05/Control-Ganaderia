import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lotId = parseInt(id);

    if (isNaN(lotId)) {
      return NextResponse.json(
        { error: 'ID de lote inválido' },
        { status: 400 }
      );
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('Finca')
      .delete()
      .eq('id', lotId);

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar el lote: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error del servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
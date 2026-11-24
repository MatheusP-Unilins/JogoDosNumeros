import { NextRequest, NextResponse } from 'next/server';
import { getScores, saveScore, resetScores } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const difficulty = searchParams.get('difficulty') || undefined;

    const scores = await getScores(difficulty);
    return NextResponse.json({ success: true, scores });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar scores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player_name, difficulty, attempts, secret_number } = body;

    if (!player_name || typeof player_name !== 'string' || player_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome do jogador é obrigatório.' },
        { status: 400 }
      );
    }

    if (!['iniciante', 'intermediario', 'avancado'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Dificuldade inválida.' },
        { status: 400 }
      );
    }

    if (typeof attempts !== 'number' || attempts <= 0) {
      return NextResponse.json(
        { success: false, error: 'Número de tentativas inválido.' },
        { status: 400 }
      );
    }

    const saved = await saveScore({
      player_name: player_name.trim().slice(0, 30),
      difficulty,
      attempts,
      secret_number: Number(secret_number),
    });

    return NextResponse.json({ success: true, score: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar pontuação' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const difficulty = searchParams.get('difficulty') || undefined;

    await resetScores(difficulty);
    return NextResponse.json({ success: true, message: 'Hall da fama resetado com sucesso!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao resetar hall da fama' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

// This forces AWS Amplify to build a real backend server!
export const dynamic = 'force-dynamic'; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Secure Server-to-Server handshake bypassing Chrome's Mixed Content blocks
        const res = await fetch('http://43.204.232.236:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Next.js Bridge failed to reach Fargate." }, 
            { status: 500 }
        );
    }
}
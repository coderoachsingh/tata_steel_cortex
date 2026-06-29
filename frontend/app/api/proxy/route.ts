import { NextResponse } from 'next/server';

// Forces AWS Amplify to build a real backend server for the dashboard
export const dynamic = 'force-dynamic'; 

export async function POST(request: Request) {
    try {
        const incomingData = await request.json();
        
        // Extract the target Python endpoint and the actual payload
        const { endpoint, method = 'POST', payload } = incomingData;
        
        // Secure Server-to-Server handshake to FastAPI (Bypasses Browser Blocks!)
        const res = await fetch(`http://3.111.31.72:8000${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: payload ? JSON.stringify(payload) : undefined,
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Dashboard Bridge Error: Failed to reach FastAPI backend." }, 
            { status: 500 }
        );
    }
}
import { NextResponse } from 'next/server';

// This forces AWS Amplify to build a real backend server!
export const dynamic = 'force-dynamic'; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. THE KILL SWITCH: Prevent AWS Lambda from timing out if Fargate goes dark
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6-second timeout

        // 2. The Secure Handshake
        const res = await fetch('http://43.204.232.236:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal // Attach the kill switch
        });

        clearTimeout(timeoutId); // If we get a response, cancel the kill switch

        // 3. SAFE PARSING: Grab text first to prevent HTML 500 pages from crashing the JSON parser
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            return NextResponse.json(
                { success: false, message: `Fargate returned invalid data (Not JSON). Is the port 4000 server running?` }, 
                { status: 502 }
            );
        }

        return NextResponse.json(data, { status: res.status });

    } catch (error: any) {
        // 4. PRECISION ERROR LOGGING
        const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
        
        return NextResponse.json(
            { 
                success: false, 
                message: isTimeout 
                    ? "Bridge Error: Fargate timed out. The IP address likely changed!" 
                    : `Bridge Error: ${error.message}` 
            }, 
            { status: 500 }
        );
    }
}
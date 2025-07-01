import Terminal from './components/terminal/Terminal';

export default function Home() {
  const welcomeMessage = `
┌─────────────────────────────────────── SmartMarkets.ai ────────────────────────────────────────┐
│                                                                                                │
│  🏥 SmartMarkets.ai - Hospital M&A Territorial Intelligence                           v2.0.0  │
│                                                                                                │
│  CLI-First SaaS for Healthcare Executives                                                      │
│                                                                                                │
│  🔐 Secure Terminal Interface  💰 $499/month Professional  🧪 $1/month Beta                    │
│                                                                                                │
│  $ demo                                                                                        │
│                                                                                                │
│  > login neo@smartmarkets.ai                                                                  │
│  ✅ Magic link sent to neo@smartmarkets.ai                                                    │
│                                                                                                │
│  > claim --group="Trinity Health"                                                             │
│  ✅ Successfully claimed authority for Trinity Health                                          │
│  Hospitals under your authority: 87                                                           │
│  Primary states: MI, OH, CA, AL, CT, FL, GA, ID, IL, IN, IA, MD, MA, NE, NY, NC, PA          │
│                                                                                                │
│  > get QBR                                                                                    │
│  🔐 Authenticating hospital group authority...                                                │
│  🔍 Discovering territorial competitors...                                                    │
│  📊 Assembling territorial intelligence blocks...                                             │
│  📈 Generating executive Excel report...                                                      │
│  📧 Delivering report to your inbox...                                                        │
│                                                                                                │
│  ✅ QBR delivered in 45 seconds                                                               │
│  Excel file: 847 territory blocks, 23 competitors                                             │
│  File size: 12.3MB with pivot tables ready for analysis                                       │
│                                                                                                │
│  🎯 Ready to start? Try these commands:                                                       │
│                                                                                                │
│  login <your-email>        - Send magic link authentication                                   │
│  subscribe --plan=beta     - Start with $1/month beta access                                  │
│  claim --group="Your System" - Claim your hospital group authority                            │
│  help                      - See all available commands                                       │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6 text-center">SmartMarkets.ai</h1>
        <p className="text-center mb-8">Hospital M&A Territorial Intelligence - CLI-First SaaS</p>
        
        <div className="w-full h-[800px]">
          <Terminal />
        </div>
      </div>
    </main>
  );
}

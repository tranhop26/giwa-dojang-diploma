import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-secondary/15 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="z-10 text-center space-y-8 max-w-md w-full">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Dojang Diploma
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            On-Chain Verifiable Diplomas on GIWA Sepolia Testnet
          </p>
        </div>

        <div className="flex justify-center p-6 border border-border/40 rounded-2xl bg-card/50 backdrop-blur-md shadow-2xl">
          <ConnectButton />
        </div>
      </div>
    </main>
  );
}


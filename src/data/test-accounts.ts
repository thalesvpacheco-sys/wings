/**
 * Senhas provisórias do login (modo de teste, enquanto o Firebase não está configurado).
 * Guardamos só o SHA-256 de "email:senha"; as senhas em si ficam em contas-provisorias.local.md,
 * fora do git. Trava provisória: a conferência é no navegador, não é segurança de verdade.
 * Gerado por um script; para trocar as senhas, gere de novo.
 */
export const testPasswordHashes: Record<string, string> = {
  "thales.pacheco@wingsbr.app": "bfbbee3165ba850185bccb1c8603381e0c431f076a6e67d5a2202f4d0355e1c4",
  "bruno.dourado@wingsbr.app": "d5991c3f7b38a1cc5160d7601a38d39fc49a322e71ce155f55979cadbc5d7a40",
  "nalbert.guiliani@wingsbr.app": "e7192b72e6be930d8f49942976ffcde8efc6291e31a33a6d45566da339b69475",
  "anderson@wingsbr.app": "78832b51ba349c3411422efcf853132e38b10699a6b83d8da230f9c8b95541b2",
  "faustino@wingsbr.app": "7aab2f2764a415a530f7c5a357b79d80ee6014a2fbf0cc88f5892988328e5af3",
  "pedro.faustino@wingsbr.app": "ebb0bb2173e1909da1b65ff8ae845064175bf8190c4494531393157fc34884ba",
};

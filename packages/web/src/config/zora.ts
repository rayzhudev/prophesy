// import {
//   createCreatorClient,
//   createCollectorClient,
//   type CreatorClient,
//   type CollectorClient,
// } from "@zoralabs/protocol-sdk";
// import { chainId, publicClient } from "./chains";
// import { useWallet } from "./wallet";
// import { useMemo } from "react";

// // Interface for Zora clients
// export interface ZoraClients {
//   creatorClient: CreatorClient;
//   collectorClient: CollectorClient;
// }

// // Hook that provides Zora clients based on the current wallet context
// export function useZoraClients(isAdmin: boolean = false): ZoraClients {

//   return useMemo(
//     () => ({
//       creatorClient: createCreatorClient({
//         chainId,
//         publicClient,
//       }),
//       collectorClient: createCollectorClient({
//         chainId,
//         publicClient,
//       }),
//     }),
//     [publicClient]
//   );
// }

"use client";

import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  createCreatorClient,
  ContractMetadataJson,
  TokenMetadataJson,
} from "@zoralabs/protocol-sdk";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContractForm {
  contractMetadata: ContractMetadataJson;
  tokenMetadata: TokenMetadataJson;
}

const defaultForm: ContractForm = {
  contractMetadata: {
    name: "",
    description: "",
    image: "",
  },
  tokenMetadata: {
    name: "",
    description: "",
    image: "",
    animation_url: "",
    attributes: [],
  },
};

export default function AdminPage() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isCreating, setIsCreating] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ContractForm>(defaultForm);
  const [newAttribute, setNewAttribute] = useState({
    trait_type: "",
    value: "",
  });

  const handleMetadataChange = (
    type: "contractMetadata" | "tokenMetadata",
    field: string,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setForm((prev) => ({
        ...prev,
        tokenMetadata: {
          ...prev.tokenMetadata,
          attributes: [...prev.tokenMetadata.attributes, newAttribute],
        },
      }));
      setNewAttribute({ trait_type: "", value: "" });
    }
  };

  const removeAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tokenMetadata: {
        ...prev.tokenMetadata,
        attributes: prev.tokenMetadata.attributes.filter((_, i) => i !== index),
      },
    }));
  };

  const createContract = async () => {
    if (!address || !publicClient) return;

    try {
      setIsCreating(true);
      setError(null);

      // Create contract metadata JSON
      const contractMetadataUri = `data:application/json;base64,${btoa(
        JSON.stringify(form.contractMetadata)
      )}`;

      // Create token metadata JSON
      const tokenMetadataUri = `data:application/json;base64,${btoa(
        JSON.stringify(form.tokenMetadata)
      )}`;

      // Create Zora Creator client
      const creatorClient = createCreatorClient({
        chainId,
        publicClient,
      });

      // Create a new ERC-1155 contract
      const { parameters, contractAddress: newContractAddress } =
        await creatorClient.create1155({
          contract: {
            name: form.contractMetadata.name || "test",
            uri: contractMetadataUri,
          },
          token: {
            tokenMetadataURI: tokenMetadataUri,
            salesConfig: {
              // Name of the erc20z token to create for the secondary sale.  If not provided, uses the contract name
              erc20Name: "testToken",
              // Symbol of the erc20z token to create for the secondary sale.  If not provided, extracts it from the name.
              erc20Symbol: "TEST",
              // Earliest time a token can be minted.  If undefined or 0, then it can be minted immediately.  Defaults to 0n.
              saleStart: undefined,
              // Market countdown, in seconds, that will start once the minimum mints for countdown is reached. Defaults to 24 hours.
              marketCountdown: undefined,
              // Minimum quantity of mints that will trigger the countdown.  Defaults to 1111n
              minimumMintsForCountdown: undefined,
            },
          },
          account: address,
        });

      // Execute the contract creation transaction
      const tx = await writeContractAsync(parameters);
      console.log("tx", tx);
      setContractAddress(newContractAddress);
    } catch (err) {
      console.error("Error creating contract:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create contract"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const isConnected = !!address;
  const isFormValid = form.tokenMetadata.name;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <ConnectWalletButton />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Zora Contract Management</h2>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to create and manage Zora contracts for minting
          tweets as NFTs.
        </p>

        <CardContent className="p-0">
          {!contractAddress ? (
            <div className="space-y-8">
              {/* Contract Metadata Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Contract Metadata</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-name">
                      Name{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="contract-name"
                      value={form.contractMetadata.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleMetadataChange(
                          "contractMetadata",
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Prophesy Tweets"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-description">
                      Description{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="contract-description"
                      value={form.contractMetadata.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleMetadataChange(
                          "contractMetadata",
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe your collection..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-image">
                      Collection Image URL{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="contract-image"
                      value={form.contractMetadata.image}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleMetadataChange(
                          "contractMetadata",
                          "image",
                          e.target.value
                        )
                      }
                      placeholder="e.g., ipfs://..."
                    />
                  </div>
                </div>
              </div>

              {/* Token Metadata Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Token Metadata Template
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-name">
                      Name Template <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="token-name"
                      value={form.tokenMetadata.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleMetadataChange(
                          "tokenMetadata",
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Tweet #{id}"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-description">
                      Description Template{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="token-description"
                      value={form.tokenMetadata.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleMetadataChange(
                          "tokenMetadata",
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Template for tweet descriptions..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-image">
                      Image URL Template{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="token-image"
                      value={form.tokenMetadata.image}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleMetadataChange(
                          "tokenMetadata",
                          "image",
                          e.target.value
                        )
                      }
                      placeholder="e.g., ipfs://..."
                    />
                  </div>

                  {/* Attributes Section */}
                  <div className="space-y-4">
                    <Label>
                      Attributes{" "}
                      <span className="text-muted-foreground text-sm">
                        (optional)
                      </span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Trait Type"
                        value={newAttribute.trait_type}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAttribute((prev) => ({
                            ...prev,
                            trait_type: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Value"
                        value={newAttribute.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAttribute((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAttribute}
                      disabled={!newAttribute.trait_type || !newAttribute.value}
                    >
                      Add Attribute
                    </Button>

                    {form.tokenMetadata.attributes.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {form.tokenMetadata.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted/50 p-2 rounded"
                          >
                            <span>
                              {attr.trait_type}: {attr.value}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttribute(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={createContract}
                disabled={!isConnected || isCreating || !isFormValid}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create ERC-1155 Contract"}
              </Button>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-green-600 font-medium">
                Contract created successfully!
              </p>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Contract Address
                </label>
                <code className="block bg-muted/50 p-3 rounded text-sm break-all">
                  {contractAddress}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

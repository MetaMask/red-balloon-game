import { decodeFunctionData } from "viem";
import { type UserOperation } from "permissionless";
import { DeleGatorCore } from "@codefi/delegator-core-viem";

type CallData = { args: readonly unknown[] | undefined; functionName: string };

export async function POST(req: Request) {
  const {
    data: {
      object: {
        userOperation: { callData },
      },
    },
  } = (await req.json()) as {
    data: { object: { userOperation: UserOperation<"v0.7"> } };
  };

  let decodedCallData: CallData;
  try {
    decodedCallData = decodeFunctionData({
      abi: DeleGatorCore.abi,
      data: callData,
    });
  } catch (e) {
    console.error("Failed to decode calldata", e);
    // failed to decode calldata
    return new Response(JSON.stringify({ sponsor: false }), {
      status: 200,
    });
  }

  if (decodedCallData?.functionName !== "redeemBatch") {
    console.error("Invalid function name", decodedCallData);
    // not calling redeemBatch
    return new Response(JSON.stringify({ sponsor: false }), {
      status: 200,
    });
  }

  return new Response(JSON.stringify({ sponsor: true }), {
    status: 200,
  });
}

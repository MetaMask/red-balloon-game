import {
  formatCommission,
  isCommissionInRange,
  isCommissionInteger,
} from "@/lib/utils";
import { Input } from "./ui/input";
import { CircleInfoIcon } from "./icons";
import { OFFER_LOWER_LIMIT, OFFER_UPPER_LIMIT } from "@/lib/constants";

export const CommissionCard = ({
  index,
  commission,
  onChange,
  value,
}: {
  index: string;
  commission: number;
  value?: string;
  onChange: (value: string) => void;
}) => {
  const isInteger = isCommissionInteger(value);
  const inRange = isCommissionInRange(value);

  const renderError = () => {
    if (!isInteger) {
      return "Decimals are not allowed";
    }
    if (!inRange) {
      return `Invalid commission. Min: ${OFFER_LOWER_LIMIT}% / Max: ${OFFER_UPPER_LIMIT}%`;
    }
    return null;
  };

  return (
    <div className="flex flex-col rounded-lg bg-[hsla(0,0%,100%,0.05)]">
      <div className="flex justify-between rounded-t-lg border-b border-gray-900 px-4 py-2">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-muted-foreground">
            BALLOON
          </div>
          <div className="leading-[22px]">{Number(index) + 1}</div>
        </div>
        {!!commission && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              COMMISSION
            </div>
            <div className="leading-[22px]">
              {formatCommission(commission).percentage} {"  "}
              <span className="text-muted-foreground">
                {formatCommission(commission).eth}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4 pt-3">
        <div className="text-sm font-medium leading-6">YOUR COMMISSION</div>
        <Input
          placeholder="Enter Percentage"
          className="border-0"
          type="number"
          step="1"
          onChange={(e) => onChange(e.target.value)}
          value={value}
          onWheel={(e) => e.currentTarget.blur()}
        />
        {value && (!inRange || !isInteger) && (
          <p className="mt-2 text-xs text-red-500">{renderError()}</p>
        )}
        {!!commission && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <CircleInfoIcon className="h-4 w-4" />
            <span>Added onto the previous commission.</span>
          </div>
        )}
      </div>
    </div>
  );
};

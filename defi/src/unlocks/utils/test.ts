import { euler } from "../adapters/uniswap";
import {
  AdapterResult,
  StepAdapterResult,
  CliffAdapterResult,
  LinearAdapterResult,
  RawResult,
  ChartYAxisData,
  ChartData,
} from "../types/adapters";
import { rawToChartData } from "./convertToChartData";
import {
  stepAdapterToRaw,
  cliffAdapterToRaw,
  linearAdapterToRaw,
} from "./convertToRawData";

export async function generateChart(
  adapter: Promise<AdapterResult[]>,
): Promise<ChartData> {
  const adapterResults = await adapter;
  const rawResults = adapterResults.map((r: AdapterResult) => {
    switch (r.type) {
      case "step":
        return stepAdapterToRaw(<StepAdapterResult>r);
      case "cliff":
        return cliffAdapterToRaw(<CliffAdapterResult>r);
      case "linear":
        return linearAdapterToRaw(<LinearAdapterResult>r);
      default:
        return [];
    }
  });

  const bigUnixTime: number = 10_000_000_000;
  const startTime: number = Math.min(
    ...adapterResults.map((r: AdapterResult) =>
      r.start == null ? bigUnixTime : r.start,
    ),
  );

  const data = rawResults.map((r: RawResult[]) => rawToChartData(r, startTime));

  const xAxis: number[] = Array.from(
    Array(
      Number(Math.max(...data.map((d: ChartYAxisData) => d.data.length))),
    ).keys(),
  ).map((i: number) => startTime + i * data[0].increment);

  return { data, xAxis };
}
generateChart(euler); // ts-node utils/test.ts

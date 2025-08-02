import { IStatusHistory, RideStatus } from "../modules/ride/ride.interface";

export const addStatusHistoryEntry = (
	ride: any,
	newStatus: RideStatus
): IStatusHistory => {
	const historyEntry: IStatusHistory = {
		status: newStatus,
		timestamp: new Date(),
	};

	ride.statusHistory.push(historyEntry);

	return historyEntry;
};

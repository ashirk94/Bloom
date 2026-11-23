import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../api";

interface ApiState<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
}

// A custom hook: reusable logic for "load something from the API when the
// page appears, and track whether it is loading or failed".
//
//   const { data, error, loading, reload } = useApi<MatchesResponse>("/matches");
//
// `data` is null until the answer arrives (or if it failed), so TypeScript
// makes pages check for that before reading from it.
export function useApi<T>(path: string) {
	const [state, setState] = useState<ApiState<T>>({
		data: null,
		error: null,
		loading: true
	});

	const load = useCallback(async () => {
		try {
			const data = await api<T>(path);
			setState({ data, error: null, loading: false });
		} catch (err) {
			setState({ data: null, error: errorMessage(err), loading: false });
		}
	}, [path]);

	useEffect(() => {
		// `ignore` stops an old request from overwriting a newer one if the
		// path changes (or the page closes) before the answer arrives
		let ignore = false;
		setState((previous) => ({ ...previous, loading: true }));
		api<T>(path)
			.then((data) => {
				if (!ignore) setState({ data, error: null, loading: false });
			})
			.catch((err: unknown) => {
				if (!ignore) setState({ data: null, error: errorMessage(err), loading: false });
			});
		return () => {
			ignore = true;
		};
	}, [path]);

	return { ...state, reload: load };
}

import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

// A custom hook: reusable logic for "load something from the API when the
// page appears, and track whether it is loading or failed".
//
//   const { data, error, loading, reload } = useApi("/matches");
export function useApi(path) {
	const [state, setState] = useState({ data: null, error: null, loading: true });

	const load = useCallback(async () => {
		try {
			const data = await api(path);
			setState({ data, error: null, loading: false });
		} catch (err) {
			setState({ data: null, error: err.message, loading: false });
		}
	}, [path]);

	useEffect(() => {
		// `ignore` stops an old request from overwriting a newer one if the
		// path changes (or the page closes) before the answer arrives
		let ignore = false;
		setState((previous) => ({ ...previous, loading: true }));
		api(path)
			.then((data) => {
				if (!ignore) setState({ data, error: null, loading: false });
			})
			.catch((err) => {
				if (!ignore) setState({ data: null, error: err.message, loading: false });
			});
		return () => {
			ignore = true;
		};
	}, [path]);

	return { ...state, reload: load };
}

// Pick up to `max` options and rank them. Used for interests AND values,
// on the sign-up page and the profile edit pages (four places that each had
// their own ~100 line copy of this logic before).
//
// It is a "controlled" component: it doesn't keep its own state. The parent
// passes the current list in `value` (most important first) and gets told
// about changes through `onChange`, just like an <input>.
import type { Option } from "../types";

interface RankedPickerProps {
	options: Option[];
	value: string[];
	onChange: (value: string[]) => void;
	max?: number;
}

export default function RankedPicker({ options, value, onChange, max = 5 }: RankedPickerProps) {
	const toggle = (name: string) => {
		if (value.includes(name)) {
			// unticking removes it; everything below moves up a rank
			onChange(value.filter((item) => item !== name));
		} else if (value.length < max) {
			// ticking adds it at the next free rank
			onChange([...value, name]);
		}
	};

	// moving an item to a new rank swaps it with whatever was there
	const setRank = (name: string, newIndex: number) => {
		const next = [...value];
		const oldIndex = next.indexOf(name);
		// both indexes exist (the <select> only offers ranks in the list), but
		// TypeScript can't know that, so `!` says "trust me, not undefined"
		[next[oldIndex], next[newIndex]] = [next[newIndex]!, next[oldIndex]!];
		onChange(next);
	};

	const full = value.length >= max;

	return (
		<div className="interests-grid">
			{options.map((option) => {
				const index = value.indexOf(option.name);
				const selected = index !== -1;
				return (
					<label
						key={option.name}
						className={`interest-item${selected ? " selected" : ""}`}
					>
						<input
							type="checkbox"
							checked={selected}
							disabled={!selected && full}
							onChange={() => toggle(option.name)}
						/>
						<span className="item-content">
							{option.emoji} {option.name}
						</span>
						<select
							className="rank-select"
							aria-label={`Rank for ${option.name}`}
							disabled={!selected}
							value={selected ? index : ""}
							onChange={(event) =>
								setRank(option.name, Number(event.target.value))
							}
						>
							{!selected && <option value="">Rank</option>}
							{selected &&
								value.map((_, rank) => (
									<option key={rank} value={rank}>
										{rank + 1}
									</option>
								))}
						</select>
					</label>
				);
			})}
		</div>
	);
}

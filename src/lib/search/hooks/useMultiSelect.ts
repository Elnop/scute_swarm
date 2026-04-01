export function useMultiSelect<T>(value: T[], onChange: (v: T[]) => void) {
	const toggle = (item: T) => {
		if (value.includes(item)) {
			onChange(value.filter((v) => v !== item));
		} else {
			onChange([...value, item]);
		}
	};

	return { toggle };
}

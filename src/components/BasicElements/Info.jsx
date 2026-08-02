const print_date_str = datetime_str => print_date(new Date(datetime_str));
const print_date = datetime => {
    const tzOffset = datetime.getTimezoneOffset() * 60000;
    return new Date(datetime - tzOffset).toISOString().split('T')[0];
};

const capitalize = variable =>
    variable.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase());

const get_all_combinations = arr =>
    arr
        .reduce(
            (subsets, value) =>
                subsets.concat(subsets.map(set => [value, ...set])),
            [[]]
        )
        .filter(set => set.length > 0);

export { get_all_combinations, capitalize, print_date, print_date_str };

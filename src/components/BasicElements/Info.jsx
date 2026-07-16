const print_date_str = datetime_str => print_date(new Date(datetime_str));
const print_date = datetime => {
    const tzOffset = datetime.getTimezoneOffset() * 60000;
    return new Date(datetime - tzOffset).toISOString().split('T')[0];
};

export { print_date, print_date_str };

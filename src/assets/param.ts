export function getParams() {
    const params = new URLSearchParams(window.location.search);
    const rank = params.get("rank");
    const count = params.get("count");
    const filter = params.get("filter");
    const disable_dup = params.get("disable_dup");
    const sort = params.get("sort");
    const positive = params.get("positive");
    const negative = params.get("negative");
    return {
        rank,
        count,
        filter,
        disable_dup,
        sort,
        positive,
        negative,
    };
}

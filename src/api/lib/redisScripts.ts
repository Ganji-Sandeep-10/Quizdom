import { redis } from "./redis";

const answerScript = `
if redis.call("SISMEMBER", KEYS[1], ARGV[1]) == 1 then
    return 0
end

redis.call("SADD", KEYS[1], ARGV[1])
redis.call("ZINCRBY", KEYS[2], ARGV[2], ARGV[1])

return 1
`;

export const submitAnswerAtomic = async (
    answeredSetKey: string,
    leaderboardKey: string,
    userId: string,
    score: number
) => {
    return redis.eval(
        answerScript,
        2,
        answeredSetKey,
        leaderboardKey,
        userId,
        score
    );
};
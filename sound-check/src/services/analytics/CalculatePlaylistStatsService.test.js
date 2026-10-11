import { renderHook } from '@testing-library/react';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';

describe('calculateLastPlayedDate', () => {
	const playlistSongs = [1, 2, 3, 4, 5].map(id => ({ track: { id } }));
	const recentSongs = (ids) => ids.map(id => ({ track: { id } }));

	it('returns today when five consecutive recent songs belong to the playlist', () => {
		const { result } = renderHook(() => useCalculatePlaylistStatsService());
		const today = new Date().toDateString();

		const lastPlayedDate = result.current.calculateLastPlayedDate(playlistSongs, recentSongs([1, 2, 3, 4, 5]));

		expect(new Date(lastPlayedDate).toDateString()).toBe(today);
	});

	it('does not match when a non-playlist song interrupts the five-song run', () => {
		const { result } = renderHook(() => useCalculatePlaylistStatsService());

		const lastPlayedDate = result.current.calculateLastPlayedDate(playlistSongs, recentSongs([1, 2, 99, 3, 4, 5]));

		expect(lastPlayedDate).toBeNull();
	});
});

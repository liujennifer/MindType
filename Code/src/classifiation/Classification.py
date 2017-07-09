import numpy as np
import scipy.io
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn import svm
import random
import config as cfg


class Data:
    """Preprocessing and data collection.
    
    @param all_data: the matlab data file opened

    @param random_filter: whether we want to extract random no-s or the first no-s
    note: if random_filter is set to True, the final accuracy will be in the range of 52-59%
        if random_filter is set to False, the final accuracy will consistently be 59%
        Setting it to True makes more logical sense but will yield inconsistent results.
    
    Definitions:
        epoch: the nth character in the list of characters
        trial: a full iteration of 12 flashes
        flash: whether a row or column flashed
    """

    def __init__(self, all_data, random_filter=False):

        self.training_data = all_data
        self.trials = cfg.TRIALS_PER_EPOCH
        self.flashes_per_epoch = cfg.FLASHES_PER_TRIAL
        self.flashes_per_character = cfg.FLASHES_PER_EPOCH
        self.data_points_per_flash = cfg.DATA_POINTS_PER_FLASH
        self.points_btw_flashes = cfg.FLASH_MULTIPLIER
        self.channels = cfg.CHANNELS
        self.characters = []
        self.epochs = cfg.EPOCHS
        self.character_signals = self.get_all_character_signals()
        self.character_labels = self.get_all_character_labels()
        self.character_signals_unfiltered = self.get_all_character_signals()
        if random_filter:
            self.random_filter_no(cfg.TOTAL_FLASHES_W_FILTER) 
        else:
            self.filter_no(cfg.TOTAL_FLASHES_W_FILTER)
        self.turn_into_np()
        self.characters = self.training_data['TargetChar'][0]
        self.row_col = self.get_all_character_row_col()

    # There are 85 characters (epochs)
    def get_epoch(self, epoch_index):
        epoch = []
        # there are 15 character flashes in an epoch, each is 12 flashes (1 for each row/com)
        # will use 10 repetitions only for epoch
        for flash in range(180):
            # one flash is 8 x 240
            one_flash = []
            # getting data from 8 channels
            for channel in self.channels:
                channel_signals = []
                # will take 200 ms of signal (48)
                for signal in range(240):
                    # 42 is 100 ms flash + 75 ms delay
                    # The first x data points do not help the data
                    x = 10
                    channel_signals.append(
                        float(self.training_data['Signal'][epoch_index][x + (flash * 42) + signal][channel]))
                one_flash.append(channel_signals)
            epoch.append(one_flash)
        np_one_character_signals = epoch
        return np_one_character_signals

    def get_one_character_labels(self, index):
        one_character_labels = []
        for flash in range(180):
            one_character_labels.append(self.training_data['StimulusType'][index][flash * 42])
        # np_character_labels = np.array(one_character_labels)
        return one_character_labels

    def get_all_character_signals(self):
        all_character_signals = []
        for character in range(85):
            all_character_signals.append(self.get_epoch(character))
        return all_character_signals

    def get_all_character_labels(self):
        all_character_labels = []
        for character in range(85):
            all_character_labels.append(self.get_one_character_labels(character))
        return all_character_labels

    def get_all_character_row_col(self):
        all_character_row_col = []
        for epoch in range(85):
            one_character_row_col = []
            for flash in range(180):
                one_character_row_col.append(self.training_data['StimulusCode'][epoch][flash * 42])
            # np_character_labels = np.array(one_character_labels)
            all_character_row_col.append(one_character_row_col)
        # print all_character_row_col
        return all_character_row_col


    def filter_no(self, total):
        no_num = total - 30
        num_extracted = 180 - total
        for extract in range(num_extracted):
            for epoch in range(85):
                no_index = self.character_labels[epoch].index(0)
                self.character_labels[epoch].pop(no_index)
                self.character_signals[epoch].pop(no_index)
    
    def random_filter_no(self, total):
        no_num = total - 30
        num_extracted = 180 - total
        for extract in range(num_extracted):
            for epoch in range(85):
                no_index = random.randint(0, 179 - num_extracted)
                while self.character_labels[epoch][no_index] != 0:
                    # print self.character_labels[epoch][no_index], no_index
                    no_index = random.randint(0, 179 - num_extracted)
                self.character_labels[epoch].pop(no_index)
                self.character_signals[epoch].pop(no_index)

    def turn_into_np(self):
        for i in range(85):
            self.character_signals[i] = np.array(self.character_signals[i])
            self.character_labels[i] = np.array(self.character_labels[i])
            self.character_signals_unfiltered[i] = np.array(self.character_signals_unfiltered[i])


class CharacterClassification:
    def __init__(self, channels_data, expected_result, row_col):
        # initializing class var
        self.num_channels = 8
        self.training_data = np.array(channels_data)
        self.training_data = np.swapaxes(self.training_data, 1, 2)
        self.training_results = np.array(expected_result)
        self.lda_classifiers = []
        self.predictions = []
        self.row_col = row_col
        for channel in range(self.num_channels):
            self.predictions.append([])
            self.lda_classifiers.append(LinearDiscriminantAnalysis(tol=1e-4))

            # self.lda = LinearDiscriminantAnalysis()
            # self.lda.fit_transform(channels_data, expected_result)

    def train(self):
        fit_data_list = []
        fit_prediction_list = []
        for channel in range(self.num_channels):
            fit_data_list.append([])
            fit_prediction_list.append([])

        for epoch in range(85):
            for channel in range(self.num_channels):
                for flash_number in range(60):
                    # print(self.training_data[epoch][channel][flash_number])
                    fit_data_list[channel].append(self.training_data[epoch][channel][flash_number])
                    # print(self.training_results[epoch][flash_number])
                    fit_prediction_list[channel].append(self.training_results[epoch][flash_number])

        fit_data_arr = np.array(fit_data_list)
        fit_prediction_arr = np.array(fit_prediction_list)

        for channel in range(self.num_channels):
            self.lda_classifiers[channel].fit(fit_data_arr[channel], fit_prediction_arr[channel])

    def get_predictions(self, channels_data, expected_characters=""):
        """
        Predicts the row or column based on the minimum distance of the row/col from the sample to the 
        hyperplane. 


        @param channels_data: 3d matrix of the data to be predicted (w, x, y, z)
            w: number of trials
            x: number of flashes per trial
            y: number of channels per flash
            z: number of data points per channel
        @param expected_characters: string of the expected characters (optional)
        """
        percentage = 0
        channels_data = np.array(channels_data)
        channels_data = np.swapaxes(channels_data, 1, 2)
        row_col_flashed = self.row_col
        for epoch in range(85):
            confidence_scores = []
            # row/col that predicted yes
            row_col_true = []
            predictions = {}
            for flash in range(180):
                flash_confidence = 0
                for channel in range(8):
                    to_predict = [channels_data[epoch][channel][flash]]
                    # print len(self.row_col[0])
                    flash_confidence += self.lda_classifiers[channel].decision_function(to_predict)
                if self.row_col[epoch][flash] in predictions:
                    predictions[int(self.row_col[epoch][flash])] += flash_confidence
                else:
                    predictions[self.row_col[epoch][flash]] = flash_confidence
                confidence_scores.append(predictions)
            
            row_scores = list(np.zeros(6))
            col_scores = list(np.zeros(6))
            all_scores = [col_scores, row_scores]
            
            for flash_score in confidence_scores:  
                for row_col in range(12):
                    if row_col < 6:
                        # print flash_score, row_col + 1
                        all_scores[0][row_col] += flash_score[row_col+1]
                    elif row_col < 12:
                        all_scores[1][row_col-6] += flash_score[row_col+1]
        
            for row_col in range(12):
                if row_col < 6:
                    all_scores[0][row_col] = all_scores[0][row_col][0] / 180
                    
                elif row_col >= 6:
                    all_scores[1][row_col-6] = all_scores[1][row_col-6][0] / 180

            
            
            buttons = [[], [], [], [], [], []]
            for row in range(6):
                for col in range(6):
                    character_number = (row * 6) + col
                    # a-z buttons
                    if character_number < 26:
                        button_name = chr(ord('a') + character_number).upper()
                    # 0-9 buttons
                    elif character_number < 36:
                        button_name = str(character_number - 25)
                    else:
                        button_name = '_'
                    buttons[row].append(button_name)
            
            col, row = all_scores[0].index(max(all_scores[0])), all_scores[1].index(max(all_scores[1]))

            print "confidence: ", all_scores
            
            # if len(row_col_true) > 1:
            #     # print epoch,
            #     track = np.zeros(12)
            #     for value in row_col_true:
            #         track[value-1] += 1

            # print "row: ", row, " col: ", col
            

            col, row = int(col), int(row)
            print "row/col: ", col, row
            print "predicted: ", buttons[row][col]
            print "expected: ", expected_characters[0][epoch]




            if buttons[row][col] == expected_characters[0][epoch]:
                percentage += 1
                
            print "number correct: ", percentage, ", percentage: ", (percentage / 85.0) * 100
            print "\n"

        print "\n"
        return percentage


if __name__ == '__main__':
    data = scipy.io.loadmat(cfg.FILE_PATH)
    test_data = scipy.io.loadmat(cfg.TEST_FILE_PATH)

    all_data = Data(data)
    # print(np.shape(all_data.training_data['Signal']))
    # print "Row Col, data: ", all_data.row_col
    row_col_data = all_data.get_all_character_row_col()
    # print "row_colo_data", row_col_data

    classifier = CharacterClassification(all_data.character_signals,
                                         all_data.character_labels, row_col_data)

    classifier.train()
    # print(all_data.training_data['TargetChar'])
    print(classifier.get_predictions(all_data.character_signals_unfiltered, all_data.training_data['TargetChar']))